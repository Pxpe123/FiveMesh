using System.Text.Json;
using FiveMesh.Engine.Cli;
using FiveMesh.Engine.Contracts;
using FiveMesh.Engine.Infrastructure.CodeWalker;

namespace FiveMesh.Engine.Application;

internal sealed class PreviewModelService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    internal async Task WriteAsync(
        PreviewCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var asset = await DrawableAssetLoader.LoadAsync(command.ModelPath, cancellationToken);
        var meshes = GeometryExtractor.Extract(asset.Models);

        if (meshes.Count == 0)
        {
            throw new InvalidDataException(
                "No renderable geometry was found in the selected file."
            );
        }

        var textures = await TextureExtractor.ExtractAsync(
            asset.EmbeddedTextures,
            command.TexturePath,
            cancellationToken
        );

        var preview = new PreviewModel(
            Version: 1,
            Name: Path.GetFileName(command.ModelPath),
            Format: asset.Format,
            Meshes: meshes,
            Textures: textures,
            Bounds: new PreviewBounds(
                [
                    asset.BoundingBoxMin.X,
                    asset.BoundingBoxMin.Y,
                    asset.BoundingBoxMin.Z
                ],
                [
                    asset.BoundingBoxMax.X,
                    asset.BoundingBoxMax.Y,
                    asset.BoundingBoxMax.Z
                ]
            )
        );

        var outputDirectory = Path.GetDirectoryName(Path.GetFullPath(command.OutputPath));
        if (!string.IsNullOrEmpty(outputDirectory))
        {
            Directory.CreateDirectory(outputDirectory);
        }

        await using var output = File.Create(command.OutputPath);
        await JsonSerializer.SerializeAsync(
            output,
            preview,
            JsonOptions,
            cancellationToken
        );
    }
}
