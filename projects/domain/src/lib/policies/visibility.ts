import {
    AssetSummary,
    DemoIdentity,
    Person,
    RequestSummary,
} from '../models/foundation';

export function canSeeRequest(
    request: RequestSummary,
    identity: DemoIdentity,
): boolean {
    return (
        identity.role === 'administrator' ||
        (identity.role === 'manager'
            ? request.teamId === identity.teamId
            : request.requesterId === identity.personId)
    );
}

export function canSeeAsset(
    asset: AssetSummary,
    identity: DemoIdentity,
    people: readonly Person[],
): boolean {
    if (identity.role === 'administrator') return true;
    if (identity.role === 'employee')
        return asset.assigneeId === identity.personId;
    return people.some(
        (person) =>
            person.id === asset.assigneeId && person.teamId === identity.teamId,
    );
}
