using System.Text.Json;
using CodeWalker.GameFiles;
using FiveMesh.Engine.Cli;
using FiveMesh.Engine.Contracts;
using FiveMesh.Engine.Infrastructure.CodeWalker;
using SharpDX;

namespace FiveMesh.Engine.Application;

internal sealed class MloPreviewService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    internal async Task WriteAsync(
        MloPreviewCommand command,
        CancellationToken cancellationToken = default
    )
    {
        if (!File.Exists(command.YtypPath))
        {
            throw new FileNotFoundException("The selected YTYP file does not exist.", command.YtypPath);
        }

        var file = new YtypFile();
        file.Load(await File.ReadAllBytesAsync(command.YtypPath, cancellationToken));

        var archetypes = (file.AllArchetypes ?? [])
            .Select(CreateArchetypePreview)
            .ToArray();
        var assets = new List<MloAssetPreview>();
        foreach (var assetPath in command.AssetPaths)
        {
            var asset = await DrawableAssetLoader.LoadAsync(assetPath, cancellationToken);
            assets.Add(new MloAssetPreview(
                Path.GetFileName(assetPath),
                asset.Format,
                asset.Models.Length,
                Vector(asset.BoundingBoxMin),
                Vector(asset.BoundingBoxMax)
            ));
        }

        var preview = new MloPreview(
            Version: 1,
            Name: Path.GetFileName(command.YtypPath),
            Archetypes: archetypes,
            Assets: assets,
            RequiredDrawables: archetypes
                .Select(item => item.DrawableDictionary)
                .Where(IsAssetName)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray(),
            RequiredTextures: archetypes
                .Select(item => item.TextureDictionary)
                .Where(IsAssetName)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray()
        );

        var outputDirectory = Path.GetDirectoryName(Path.GetFullPath(command.OutputPath));
        if (!string.IsNullOrEmpty(outputDirectory))
        {
            Directory.CreateDirectory(outputDirectory);
        }

        await using var output = File.Create(command.OutputPath);
        await JsonSerializer.SerializeAsync(output, preview, JsonOptions, cancellationToken);
    }

    private static MloArchetypePreview CreateArchetypePreview(Archetype archetype)
    {
        if (archetype is not MloArchetype mlo)
        {
            return new MloArchetypePreview(
                archetype.Name,
                false,
                HashName(archetype.DrawableDict),
                HashName(archetype.TextureDict),
                Vector(archetype.BBMin),
                Vector(archetype.BBMax),
                [],
                [],
                []
            );
        }

        return new MloArchetypePreview(
            mlo.Name,
            true,
            HashName(mlo.DrawableDict),
            HashName(mlo.TextureDict),
            Vector(mlo.BBMin),
            Vector(mlo.BBMax),
            (mlo.rooms ?? [])
                .Select(room => new MloRoomPreview(
                    room.Index,
                    room.RoomName,
                    Vector(room.BBMin),
                    Vector(room.BBMax),
                    room.Data.floorId,
                    room.Data.portalCount,
                    room.Data.exteriorVisibiltyDepth
                ))
                .ToArray(),
            (mlo.portals ?? [])
                .Select(portal => new MloPortalPreview(
                    portal.Index,
                    portal.Data.roomFrom,
                    portal.Data.roomTo,
                    portal.Data.flags,
                    portal.Data.opacity,
                    (portal.Corners ?? [])
                        .Select(corner => new[] { corner.X, corner.Y, corner.Z })
                        .ToArray(),
                    Vector(portal.Center)
                ))
                .ToArray(),
            (mlo.entities ?? [])
                .Select(entity => new MloEntityPreview(
                    entity.Index,
                    entity.Name,
                    HashName(entity.Data.archetypeName),
                    Vector(entity.Data.position),
                    [
                        entity.Data.rotation.X,
                        entity.Data.rotation.Y,
                        entity.Data.rotation.Z,
                        entity.Data.rotation.W
                    ],
                    entity.Data.scaleXY,
                    entity.Data.scaleZ
                ))
                .ToArray()
        );
    }

    private static string HashName(MetaHash hash) => hash.ToCleanString();

    private static bool IsAssetName(string value) =>
        !string.IsNullOrWhiteSpace(value) && value != "0";

    private static float[] Vector(Vector3 value) => [value.X, value.Y, value.Z];
}
