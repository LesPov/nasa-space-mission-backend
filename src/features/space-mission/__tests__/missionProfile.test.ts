import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { defineDatabaseAssociations } from '../../../infrastructure/database/connection';
import sequelize from '../../../infrastructure/database/config';
import episodeRoutes from '../../episodes/routes/episodeRoutes';
import { errorMiddleware } from '../../../infrastructure/middleware/error.middleware';
import { EpisodeModel } from '../../episodes/models/episodeModel';
import { MissionProfileModel } from '../models/missionProfileModel';
import { CreateMissionProfileDto } from '../../../shared/contracts/space-mission.contracts';

const app = express();
app.use(express.json());
app.use('/api/episodes', episodeRoutes);
app.use(errorMiddleware);

const request = supertest(app);

describe('Space Mission Domain - MissionProfile Integration Suite', () => {
    let adminToken: string;
    let createdEpisodeId: number;
    const SECRET = process.env.SECRET_KEY || 'test_secret_key_12345';

    before(async () => {
        process.env.SECRET_KEY = SECRET;
        defineDatabaseAssociations();
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        adminToken = jwt.sign({ userId: 1, rol: 'admin', username: 'admin_test' }, SECRET, { expiresIn: '1h' });

        const episode = await EpisodeModel.create({
            title: 'Misión Marte - Fase Exploración',
            description: 'Episodio de prueba de integración aeroespacial',
            thumbnailUrl: '/test/thumb.png',
            authorId: 1
        });
        createdEpisodeId = (episode as any).id;
    });

    after(async () => {
        if (createdEpisodeId) {
            await MissionProfileModel.destroy({ where: { episodeId: createdEpisodeId } });
            await EpisodeModel.destroy({ where: { id: createdEpisodeId } });
        }
    });

    const validPayload: CreateMissionProfileDto = {
        missionName: 'Ares V - Reconocimiento Atmosférico',
        missionCode: 'ARS-V-001',
        description: 'Vuelo orbital y despliegue de sondas en atmósfera marciana.',
        missionStatus: 'PRE_LAUNCH',
        currentPhase: 'Chequeo de Sistemas de Propulsión',
        completionPercentage: 15.5,
        assignedBudget: 50000000.0,
        spentBudget: 12500000.0,
        spacecraftName: 'Hermes Recon',
        spacecraftModel: 'Orbital Surveyor MK-II',
        spacecraftMassKg: 12450.0,
        spacecraftPowerWatts: 45000.0,
        spacecraftFuelCapacityKg: 8500.0,
        components: [
            {
                id: 'prop-ion-01',
                type: 'propulsion',
                name: 'Motor Iónico NEXT-C',
                manufacturer: 'Aerojet Rocketdyne',
                status: 'NOMINAL',
                health: 100,
                specifications: {
                    thrustKn: 0.236,
                    specificImpulseSec: 4190,
                    powerConsumptionWatts: 6900
                },
                configuration: {
                    gimbalEnabled: true,
                    throttlePercentage: 0
                }
            },
            {
                id: 'pwr-solar-01',
                type: 'power',
                name: 'Paneles Solares Desplegables Ultraflex',
                manufacturer: 'Northrop Grumman',
                status: 'NOMINAL',
                health: 98.5,
                specifications: {
                    powerGenerationWatts: 15000
                },
                configuration: {
                    autoSunTracking: true
                }
            }
        ],
        telemetry: {
            power: {
                currentGenerationWatts: 14800,
                currentConsumptionWatts: 3200,
                batteryLevelPercentage: 99.2
            },
            fuel: {
                fuelRemainingKg: 8500,
                fuelLevelPercentage: 100,
                burnRateKgPerSec: 0
            }
        } as any
    };

    it('Test 1 — Crear: POST 201 y persistir', async () => {
        const response = await request
            .post(`/api/episodes/${createdEpisodeId}/mission-profile`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(validPayload);

        assert.equal(response.status, 201);
        assert.ok(response.body.id);
        assert.equal(response.body.episodeId, createdEpisodeId);
        assert.equal(response.body.missionCode, 'ARS-V-001');
        assert.equal(response.body.remainingBudget, 37500000.0);
        assert.equal(response.body.components.length, 2);
    });

    it('Test 2 — Obtener: GET 200 con datos guardados', async () => {
        const response = await request
            .get(`/api/episodes/${createdEpisodeId}/mission-profile`)
            .set('Authorization', `Bearer ${adminToken}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.missionName, 'Ares V - Reconocimiento Atmosférico');
        assert.equal(response.body.spacecraftName, 'Hermes Recon');
        assert.equal(response.body.telemetryData.power.batteryLevelPercentage, 99.2);
    });

    it('Test 3 — Actualizar: PUT 200 y recálculo presupuestario', async () => {
        const updatePayload = {
            spentBudget: 20000000.0,
            completionPercentage: 35.0,
            missionStatus: 'IN_FLIGHT' as const
        };

        const response = await request
            .put(`/api/episodes/${createdEpisodeId}/mission-profile`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updatePayload);

        assert.equal(response.status, 200);
        assert.equal(response.body.spentBudget, 20000000.0);
        assert.equal(response.body.remainingBudget, 30000000.0);
        assert.equal(response.body.completionPercentage, 35.0);
        assert.equal(response.body.missionStatus, 'IN_FLIGHT');
    });

    it('Test 4 — Episodio inexistente: 404', async () => {
        const response = await request
            .get('/api/episodes/9999999/mission-profile')
            .set('Authorization', `Bearer ${adminToken}`);

        assert.equal(response.status, 404);
    });

    it('Test 5 — Payload inválido: 400 por presupuesto negativo', async () => {
        const invalidPayload = { ...validPayload, assignedBudget: -500 };
        const otherEpisode = await EpisodeModel.create({
            title: 'Episodio Temporal',
            thumbnailUrl: '/thumb.png',
            authorId: 1
        });

        const response = await request
            .post(`/api/episodes/${(otherEpisode as any).id}/mission-profile`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(invalidPayload);

        assert.equal(response.status, 400);
        assert.ok(response.body.msg.includes('assignedBudget'));

        await otherEpisode.destroy();
    });

    it('Test 6 — Duplicado: 409 Conflict', async () => {
        const response = await request
            .post(`/api/episodes/${createdEpisodeId}/mission-profile`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(validPayload);

        assert.equal(response.status, 409);
        assert.ok(response.body.msg.includes('Ya existe un perfil de misión'));
    });

    it('Test 7 — Persistencia compleja de components y telemetry', async () => {
        const dbRecord = await MissionProfileModel.findOne({ where: { episodeId: createdEpisodeId } });
        assert.ok(dbRecord);
        assert.equal(dbRecord?.getDataValue('missionCode'), 'ARS-V-001');
        assert.equal(Number(dbRecord?.getDataValue('assignedBudget')), 50000000.0);
        assert.equal(Number(dbRecord?.getDataValue('spentBudget')), 20000000.0);
        assert.equal(Number(dbRecord?.getDataValue('remainingBudget')), 30000000.0);

        const components = dbRecord?.getDataValue('components');
        assert.ok(Array.isArray(components));
        assert.equal(components.length, 2);
        assert.equal(components[0].specifications.thrustKn, 0.236);

        const telemetry = dbRecord?.getDataValue('telemetryData' as any);
        assert.ok(telemetry);
        assert.equal(telemetry.power.batteryLevelPercentage, 99.2);
    });
});