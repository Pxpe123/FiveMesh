using System.Text.Json;
using CodeWalker.GameFiles;
using FiveMesh.Engine.Cli;
using SharpDX;

namespace FiveMesh.Engine.Application;

internal sealed class MloEditService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    internal async Task WriteAsync(
        MloEditCommand command,
        CancellationToken cancellationToken = default
    )
    {
        if (!File.Exists(command.YtypPath))
        {
            throw new FileNotFoundException("The selected YTYP file does not exist.", command.YtypPath);
        }

        await using var patchStream = File.OpenRead(command.PatchPath);
        var patch = await JsonSerializer.DeserializeAsync<PortalPatch>(
            patchStream,
            JsonOptions,
            cancellationToken
        ) ?? throw new InvalidDataException("The MLO portal patch is empty.");

        var file = new YtypFile();
        file.Load(await File.ReadAllBytesAsync(command.YtypPath, cancellationToken));
        var mlo = (file.AllArchetypes ?? [])
            .OfType<MloArchetype>()
            .FirstOrDefault(item => string.Equals(item.Name, patch.Archetype, StringComparison.OrdinalIgnoreCase));

        if (mlo is null)
        {
            throw new InvalidDataException($"MLO archetype '{patch.Archetype}' was not found.");
        }

        var portal = (mlo.portals ?? []).FirstOrDefault(item => item.Index == patch.PortalIndex);
        if (portal is null)
        {
            throw new InvalidDataException($"Portal {patch.PortalIndex} was not found in '{patch.Archetype}'.");
        }

        if (patch.RoomFrom.HasValue) portal._Data.roomFrom = patch.RoomFrom.Value;
        if (patch.RoomTo.HasValue) portal._Data.roomTo = patch.RoomTo.Value;
        if (patch.Flags.HasValue) portal._Data.flags = patch.Flags.Value;
        if (patch.Opacity.HasValue) portal._Data.opacity = patch.Opacity.Value;

        if (patch.Corners is not null)
        {
            if (patch.Corners.Length != 4 || patch.Corners.Any(corner => corner.Length < 3))
            {
                throw new InvalidDataException("A portal must contain exactly four XYZ corners.");
            }

            var existingCorners = portal.Corners ?? [];
            portal.Corners = patch.Corners
                .Select((corner, index) => new Vector4(
                    corner[0],
                    corner[1],
                    corner[2],
                    existingCorners.ElementAtOrDefault(index).W
                ))
                .ToArray();
        }

        mlo.UpdatePortalCounts();
        var outputDirectory = Path.GetDirectoryName(Path.GetFullPath(command.OutputPath));
        if (!string.IsNullOrEmpty(outputDirectory)) Directory.CreateDirectory(outputDirectory);
        await File.WriteAllBytesAsync(command.OutputPath, file.Save(), cancellationToken);
    }

    private sealed record PortalPatch(
        string Archetype,
        int PortalIndex,
        uint? RoomFrom,
        uint? RoomTo,
        uint? Flags,
        uint? Opacity,
        float[][]? Corners
    );
}
