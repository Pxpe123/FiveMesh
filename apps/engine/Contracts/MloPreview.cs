namespace FiveMesh.Engine.Contracts;

internal sealed record MloPreview(
    int Version,
    string Name,
    IReadOnlyList<MloArchetypePreview> Archetypes,
    IReadOnlyList<MloAssetPreview> Assets,
    IReadOnlyList<string> RequiredDrawables,
    IReadOnlyList<string> RequiredTextures
);

internal sealed record MloAssetPreview(
    string Name,
    string Format,
    int ModelCount,
    float[] BoundsMin,
    float[] BoundsMax
);

internal sealed record MloArchetypePreview(
    string Name,
    bool IsMlo,
    string DrawableDictionary,
    string TextureDictionary,
    float[] BoundsMin,
    float[] BoundsMax,
    IReadOnlyList<MloRoomPreview> Rooms,
    IReadOnlyList<MloPortalPreview> Portals,
    IReadOnlyList<MloEntityPreview> Entities
);

internal sealed record MloRoomPreview(
    int Index,
    string Name,
    float[] BoundsMin,
    float[] BoundsMax,
    int FloorId,
    uint PortalCount,
    int ExteriorVisibilityDepth
);

internal sealed record MloPortalPreview(
    int Index,
    uint RoomFrom,
    uint RoomTo,
    uint Flags,
    uint Opacity,
    float[][] Corners,
    float[] Center
);

internal sealed record MloEntityPreview(
    int Index,
    string Name,
    string Archetype,
    float[] Position,
    float[] Rotation,
    float ScaleXY,
    float ScaleZ
);
