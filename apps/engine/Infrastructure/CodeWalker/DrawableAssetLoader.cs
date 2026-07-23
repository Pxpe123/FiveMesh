using CodeWalker.GameFiles;
using SharpDX;

namespace FiveMesh.Engine.Infrastructure.CodeWalker;

internal sealed record LoadedDrawable(
    string Format,
    DrawableModel[] Models,
    TextureDictionary? EmbeddedTextures,
    Vector3 BoundingBoxMin,
    Vector3 BoundingBoxMax
);

internal static class DrawableAssetLoader
{
    internal static async Task<LoadedDrawable> LoadAsync(
        string modelPath,
        CancellationToken cancellationToken = default
    )
    {
        if (!File.Exists(modelPath))
        {
            throw new FileNotFoundException("The selected model file does not exist.", modelPath);
        }

        var bytes = await File.ReadAllBytesAsync(modelPath, cancellationToken);
        var extension = Path.GetExtension(modelPath).ToLowerInvariant();

        return extension switch
        {
            ".ydr" => LoadYdr(bytes),
            ".yft" => LoadYft(bytes),
            _ => throw new InvalidDataException(
                "Only .ydr and .yft model files are supported."
            )
        };
    }

    private static LoadedDrawable LoadYdr(byte[] bytes)
    {
        var file = new YdrFile();
        file.Load(bytes);
        var drawable =
            file.Drawable ?? throw new InvalidDataException("The YDR contains no drawable.");

        return new LoadedDrawable(
            "YDR",
            drawable.AllModels ?? [],
            drawable.ShaderGroup?.TextureDictionary,
            drawable.BoundingBoxMin,
            drawable.BoundingBoxMax
        );
    }

    private static LoadedDrawable LoadYft(byte[] bytes)
    {
        var file = new YftFile();
        file.Load(bytes);
        var drawable = file.Fragment?.Drawable
            ?? throw new InvalidDataException("The YFT contains no primary drawable.");

        return new LoadedDrawable(
            "YFT",
            drawable.AllModels ?? [],
            drawable.ShaderGroup?.TextureDictionary,
            drawable.BoundingBoxMin,
            drawable.BoundingBoxMax
        );
    }
}
