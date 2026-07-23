using CodeWalker.GameFiles;

namespace FiveMesh.Engine.Infrastructure.CodeWalker;

internal static class ShaderTextureResolver
{
    internal static string? FindDiffuseTexture(ShaderFX? shader)
    {
        var parameters = shader?.ParametersList?.Parameters;
        var hashes = shader?.ParametersList?.Hashes;
        if (parameters is null)
        {
            return null;
        }

        for (var index = 0; index < parameters.Length; index++)
        {
            if (parameters[index]?.Data is not TextureBase texture)
            {
                continue;
            }

            var parameterName =
                hashes is not null && index < hashes.Length ? hashes[index].ToString() : "";
            if (parameterName.Contains("diffuse", StringComparison.OrdinalIgnoreCase))
            {
                return texture.Name;
            }
        }

        // Some shaders do not expose readable parameter hashes.
        return parameters
            .Select(parameter => parameter?.Data)
            .OfType<TextureBase>()
            .Select(texture => texture.Name)
            .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name));
    }
}
