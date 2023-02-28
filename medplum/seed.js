"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const core_1 = require("@medplum/core");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const repo_1 = require("./fhir/repo");
const logger_1 = require("./logger");
const searchparameters_1 = require("./seeds/searchparameters");
const structuredefinitions_1 = require("./seeds/structuredefinitions");
const valuesets_1 = require("./seeds/valuesets");
async function seedDatabase() {
    if (await isSeeded()) {
        logger_1.logger.info('Already seeded');
        return;
    }
    const firstName = 'Medplum';
    const lastName = 'Admin';
    const projectName = 'Super Admin';
    const email = 'admin@example.com';
    const password = 'medplum_admin';
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await repo_1.systemRepo.createResource({
        resourceType: 'User',
        firstName,
        lastName,
        email,
        passwordHash,
    });
    const project = await repo_1.systemRepo.createResource({
        resourceType: 'Project',
        name: projectName,
        owner: (0, core_1.createReference)(user),
        superAdmin: true,
    });
    const practitioner = await repo_1.systemRepo.createResource({
        resourceType: 'Practitioner',
        meta: {
            project: project.id,
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
        project: (0, core_1.createReference)(project),
        user: (0, core_1.createReference)(user),
        profile: (0, core_1.createReference)(practitioner),
        admin: true,
    });
    const clientApp = await repo_1.systemRepo.updateResource({
        resourceType: 'ClientApplication',
        id: 'f54370de-eaf3-4d81-a17e-24860f667912',
        meta: {
            project: project.id,
        },
        name: 'Default Application',
        secret: '75d8e7d06bf9283926c51d5f461295ccf0b69128e983b6ecdd5a9c07506895de',
        redirectUri: "http://localhost:1234/",
    });
    await repo_1.systemRepo.createResource({
        resourceType: 'ProjectMembership',
        project: (0, core_1.createReference)(project),
        user: (0, core_1.createReference)(clientApp),
        profile: (0, core_1.createReference)(clientApp),
    });
    await (0, valuesets_1.createValueSets)();
    await (0, searchparameters_1.createSearchParameters)();
    await (0, structuredefinitions_1.createStructureDefinitions)();
}
exports.seedDatabase = seedDatabase;
/**
 * Returns true if the database is already seeded.
 * @returns True if already seeded.
 */
async function isSeeded() {
    const bundle = await repo_1.systemRepo.search({
        resourceType: 'User',
        count: 1,
    });
    return !!bundle.entry && bundle.entry.length > 0;
}
