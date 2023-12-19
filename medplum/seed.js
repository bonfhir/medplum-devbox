"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.r4ProjectId = void 0;
const core_1 = require("@medplum/core");
const uuid_1 = require("uuid");
const utils_1 = require("./auth/utils");
const repo_1 = require("./fhir/repo");
const logger_1 = require("./logger");
const searchparameters_1 = require("./seeds/searchparameters");
const structuredefinitions_1 = require("./seeds/structuredefinitions");
const valuesets_1 = require("./seeds/valuesets");
exports.r4ProjectId = (0, uuid_1.v5)('R4', uuid_1.NIL);
async function seedDatabase() {
    if (await isSeeded()) {
        logger_1.globalLogger.info('Already seeded');
        return;
    }
    const [firstName, lastName, email] = ['Medplum', 'Admin', 'admin@example.com'];
    const passwordHash = await (0, utils_1.bcryptHashPassword)('medplum_admin');
    const superAdmin = await repo_1.systemRepo.createResource({
        resourceType: 'User',
        firstName,
        lastName,
        email,
        passwordHash,
    });
    const superAdminProject = await repo_1.systemRepo.createResource({
        resourceType: 'Project',
        name: 'Super Admin',
        owner: (0, core_1.createReference)(superAdmin),
        superAdmin: true,
        strictMode: true,
    });
    await repo_1.systemRepo.updateResource({
        resourceType: 'Project',
        id: exports.r4ProjectId,
        name: 'FHIR R4',
    });
    const practitioner = await repo_1.systemRepo.createResource({
        resourceType: 'Practitioner',
        meta: {
            project: superAdminProject.id,
        },
        name: [
            {
                given: [firstName],
                family: lastName,
            },
        ],
        telecom: [
            {
                system: 'email',
                use: 'work',
                value: email,
            },
        ],
    });
    await repo_1.systemRepo.createResource({
        resourceType: 'ProjectMembership',
        project: (0, core_1.createReference)(superAdminProject),
        user: (0, core_1.createReference)(superAdmin),
        profile: (0, core_1.createReference)(practitioner),
        admin: true,
    });
    // Add Default project
    const defaultProject = await repo_1.systemRepo.updateResource({
        resourceType: 'Project',
        id: 'cd8a377a-ab31-4dc2-8c71-ba18a4888a18',
        name: 'Default',
        description: 'Default project',
        strictMode: true,
        superAdmin: false,
    });
    const defaultProjectPractitioner = await repo_1.systemRepo.createResource({
        resourceType: 'Practitioner',
        meta: {
            project: defaultProject.id,
        },
        name: [
            {
                given: [firstName],
                family: lastName,
            },
        ],
        telecom: [
            {
                system: 'email',
                use: 'work',
                value: email,
            },
        ],
    });
    await repo_1.systemRepo.createResource({
        resourceType: 'ProjectMembership',
        project: (0, core_1.createReference)(defaultProject),
        user: (0, core_1.createReference)(superAdmin),
        profile: (0, core_1.createReference)(defaultProjectPractitioner),
        admin: true,
    });
    const clientApp = await repo_1.systemRepo.updateResource({
        resourceType: 'ClientApplication',
        id: 'f54370de-eaf3-4d81-a17e-24860f667912',
        meta: {
            project: defaultProject.id,
        },
        name: 'Default Application',
        secret: '75d8e7d06bf9283926c51d5f461295ccf0b69128e983b6ecdd5a9c07506895de',
        redirectUri: process.env.INITIAL_CLIENT_APP_REDIRECT_URI || 'http://localhost:3000/',
    });
    await repo_1.systemRepo.createResource({
        resourceType: 'ProjectMembership',
        project: (0, core_1.createReference)(defaultProject),
        user: (0, core_1.createReference)(clientApp),
        profile: (0, core_1.createReference)(clientApp),
    });
    // End Default project
    await (0, structuredefinitions_1.rebuildR4StructureDefinitions)();
    await (0, valuesets_1.rebuildR4ValueSets)();
    await (0, searchparameters_1.rebuildR4SearchParameters)();
}
exports.seedDatabase = seedDatabase;
/**
 * Returns true if the database is already seeded.
 * @returns True if already seeded.
 */
function isSeeded() {
    return repo_1.systemRepo.searchOne({ resourceType: 'User' });
}
//# sourceMappingURL=seed.js.map