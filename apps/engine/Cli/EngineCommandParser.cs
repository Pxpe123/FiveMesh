namespace FiveMesh.Engine.Cli;

internal static class EngineCommandParser
{
    internal const string Usage =
        "Usage: Engine preview <model.ydr|model.yft> <output.json> [textures.ytd]";

    internal static bool TryParse(
        string[] arguments,
        out EngineCommand? command,
        out string? error
    )
    {
        command = null;
        error = null;

        if (arguments.Length == 0)
        {
            error = "Choose an engine operation.";
            return false;
        }

        var operation = arguments[0].ToLowerInvariant();
        if (operation != "preview")
        {
            error = $"Unknown engine operation: {arguments[0]}";
            return false;
        }

        if (arguments.Length is < 3 or > 4)
        {
            error = "Preview expects a model, an output file, and an optional texture dictionary.";
            return false;
        }

        command = new PreviewCommand(
            arguments[1],
            arguments[2],
            arguments.Length == 4 ? arguments[3] : null
        );
        return true;
    }
}
