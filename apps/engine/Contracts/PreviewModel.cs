namespace FiveMesh.Engine.Contracts;

internal sealed record PreviewModel(
    int Version,
    string Name,
    string Format,
    IReadOnlyList<PreviewMesh> Meshes,
    IReadOnlyList<PreviewTexture> Textures,
    PreviewBounds Bounds
);

internal sealed record PreviewMesh(
    string Name,
    float[] Positions,
    float[] Normals,
    float[] Uvs,
    int[] Indices,
    string? Texture,
    string Shader,
    byte RenderBucket
);

internal sealed record PreviewTexture(string Name, string Dds);

internal sealed record PreviewBounds(float[] Min, float[] Max);
