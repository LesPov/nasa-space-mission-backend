import { AuthModel } from "./models/authModel";
import { VerificationModel } from "./models/verificationModel";
import { userProfileModel } from "../profiles/models/userProfileModel";

export const registerAuthAssociations = () => {
    // Relación Auth -> Profile
    AuthModel.hasOne(userProfileModel, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
    
    // Relación Auth -> Verification
    AuthModel.hasOne(VerificationModel, { foreignKey: 'userId', as: 'verification', onDelete: 'CASCADE' });
    VerificationModel.belongsTo(AuthModel, { foreignKey: 'userId' });
};