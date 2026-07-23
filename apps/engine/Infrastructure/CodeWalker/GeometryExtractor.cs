using CodeWalker.GameFiles;
using FiveMesh.Engine.Contracts;

namespace FiveMesh.Engine.Infrastructure.CodeWalker;

internal static class GeometryExtractor
{
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
                        Uvs: VertexAttributeReader.ReadVector2(
                            vertexData,
                            declaration,
                            VertexSemantics.TexCoord0
                        ),
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
}
