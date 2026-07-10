import { userProfileModel } from "./models/userProfileModel";
import { AuthModel } from "../auth/models/authModel";

export const registerProfilesAssociations = () => {
    // Relación inversa Profile -> Auth
    userProfileModel.belongsTo(AuthModel, { foreignKey: 'userId' });
};