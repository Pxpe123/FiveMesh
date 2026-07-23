using CodeWalker.GameFiles;
using FiveMesh.Engine.Contracts;

namespace FiveMesh.Engine.Infrastructure.CodeWalker;

internal static class GeometryExtractor
{
    private static readonly VertexSemantics[] UvSemantics =
    [
        VertexSemantics.TexCoord0,
        VertexSemantics.TexCoord1,
        VertexSemantics.TexCoord2,
        VertexSemantics.TexCoord3,
        VertexSemantics.TexCoord4,
        VertexSemantics.TexCoord5,
        VertexSemantics.TexCoord6,
        VertexSemantics.TexCoord7
    ];

    internal static IReadOnlyList<PreviewMesh> Extract(DrawableModel[] models)
    {
        var meshes = new List<PreviewMesh>();

        for (var modelIndex = 0; modelIndex < models.Length; modelIndex++)
        {
            var geometries = models[modelIndex]?.Geometries;
            if (geometries is null)
            {
                continue;
            }

            for (var geometryIndex = 0; geometryIndex < geometries.Length; geometryIndex++)
            {
                var geometry = geometries[geometryIndex];
                var vertexData = geometry?.VertexData ?? geometry?.VertexBuffer?.Data1;
                var declaration = vertexData?.Info ?? geometry?.VertexBuffer?.Info;
                var indices = geometry?.IndexBuffer?.Indices;

                if (vertexData is null || declaration is null || indices is null)
                {
                    continue;
                }

                var positions = VertexAttributeReader.ReadVector3(
                    vertexData,
                    declaration,
                    VertexSemantics.Position
                );
                if (positions.Length == 0)
                {
                    continue;
                }

                var shader = geometry?.Shader;
                meshes.Add(
                    new PreviewMesh(
                        Name: $"model-{modelIndex + 1}-mesh-{geometryIndex + 1}",
                        Positions: positions,
                        Normals: VertexAttributeReader.ReadVector3(
                            vertexData,
                            declaration,
                            VertexSemantics.Normal
                        ),
                        Uvs: ReadBestUvs(vertexData, declaration, positions.Length / 3),
                        Indices: indices.Select(value => (int)value).ToArray(),
                        Texture: ShaderTextureResolver.FindDiffuseTexture(shader),
                        Shader: shader?.FileName.ToString() ?? "default",
                        RenderBucket: shader?.RenderBucket ?? 0
                    )
                );
            }
        }

        return meshes;
    }

    private static float[] ReadBestUvs(
        VertexData vertexData,
        VertexDeclaration declaration,
        int vertexCount
    )
    {
        float[]? fallback = null;

        foreach (var semantic in UvSemantics)
        {
            var candidate = VertexAttributeReader.ReadVector2(vertexData, declaration, semantic);
            if (candidate.Length != vertexCount * 2)
            {
                continue;
            }

            fallback ??= candidate;
            if (HasUsefulUvVariation(candidate))
            {
                return candidate;
            }
        }

        return fallback ?? [];
    }

    private static bool HasUsefulUvVariation(float[] values)
    {
        if (values.Length < 4)
        {
            return false;
        }

        const float epsilon = 0.0001f;
        var firstU = values[0];
        var firstV = values[1];

        for (var index = 2; index < values.Length; index += 2)
        {
            if (
                Math.Abs(values[index] - firstU) > epsilon
                || Math.Abs(values[index + 1] - firstV) > epsilon
            )
            {
                return true;
            }
        }

        return false;
    }
}
