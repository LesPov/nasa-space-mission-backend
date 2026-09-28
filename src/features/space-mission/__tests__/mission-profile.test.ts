import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CreateMissionProfileDto } from '../../../shared/contracts/space-mission.contracts';

describe('FASE 2 - Integración Perfil de Misión Aeroespacial', () => {
    
    it('Test 1: Crear perfil de misión debe tener los datos estructurados correctamente', () => {
        const payload: CreateMissionProfileDto = {
            missionName: 'Apolo X',
            missionCode: 'AX-01',
            description: 'Misión de prueba',
            missionStatus: 'PLANNING',
            currentPhase: 'Design',
            completionPercentage: 0,
            assignedBudget: 1000,
            spentBudget: 0,
            spacecraftName: 'Eagle',
            spacecraftModel: 'Lander',
            spacecraftMassKg: 500,
            spacecraftPowerWatts: 1000,
            spacecraftFuelCapacityKg: 200,
            components: []
        };

        assert.strictEqual(payload.missionName, 'Apolo X');
        assert.strictEqual(payload.spacecraftName, 'Eagle');
    });

    it('Test 2: El contrato de componentes debe ser válido', () => {
        const payload: CreateMissionProfileDto = {
            missionName: 'Mars Explorer',
            missionCode: 'ME-01',
            description: '',
            missionStatus: 'PRE_LAUNCH',
            currentPhase: 'Assembly',
            completionPercentage: 50,
            assignedBudget: 5000,
            spentBudget: 2000,
            spacecraftName: 'Ares',
            spacecraftModel: 'Rover',
            spacecraftMassKg: 1500,
            spacecraftPowerWatts: 3000,
            spacecraftFuelCapacityKg: 500,
            components: [
                {
                    type: 'propulsion',
                    name: 'Thruster',
                    manufacturer: 'SpaceCorp',
                    status: 'NOMINAL',
                    health: 100,
                    specifications: {},
                    configuration: {}
                }
            ]
        };

        assert.strictEqual(payload.components.length, 1);
        assert.strictEqual(payload.components[0].type, 'propulsion');
    });
});