using CodeWalker.GameFiles;
using CodeWalker.Utils;
using FiveMesh.Engine.Contracts;

namespace FiveMesh.Engine.Infrastructure.CodeWalker;

internal static class TextureExtractor
{
    internal static async Task<IReadOnlyList<PreviewTexture>> ExtractAsync(
        TextureDictionary? embeddedTextures,
        string? texturePath,
        CancellationToken cancellationToken = default
    )
    {
        var textures = new Dictionary<string, PreviewTexture>(
            StringComparer.OrdinalIgnoreCase
        );
        AddDictionary(embeddedTextures, textures);

        if (!string.IsNullOrWhiteSpace(texturePath))
        {
            if (!File.Exists(texturePath))
            {
                throw new FileNotFoundException(
                    "The selected texture dictionary does not exist.",
                    texturePath
                );
            }

            var file = new YtdFile();
            file.Load(await File.ReadAllBytesAsync(texturePath, cancellationToken));
            AddDictionary(file.TextureDict, textures);
        }

        return textures.Values.ToArray();
    }

    private static void AddDictionary(
        TextureDictionary? dictionary,
        IDictionary<string, PreviewTexture> textures
    )
    {
        var items = dictionary?.Textures?.data_items;
        if (items is null)
        {
            return;
        }

        foreach (var texture in items)
        {
            if (texture?.Data?.FullData is null || string.IsNullOrWhiteSpace(texture.Name))
            {
                continue;
            }

            try
            {
                textures[texture.Name] = new PreviewTexture(
                    texture.Name,
                    Convert.ToBase64String(DDSIO.GetDDSFile(texture))
                );
            }
            catch
            {
                // Unknown GPU formats are optional; geometry can still be previewed.
            }
        }
    }
}
