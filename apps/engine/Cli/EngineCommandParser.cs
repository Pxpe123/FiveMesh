namespace FiveMesh.Engine.Cli;

internal static class EngineCommandParser
{
    internal const string Usage =
        "Usage: Engine preview <model.ydr|model.yft> <output.json> [textures1.ytd] ...\n" +
        "       Engine convert <binary-to-xml|xml-to-binary> <input> <output>\n" +
        "       Engine mlo-preview <interior.ytyp> <output.json>\n" +
        "       Engine mlo-edit <interior.ytyp> <patch.json> <output.ytyp>";

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
        if (operation == "mlo-preview")
        {
            if (arguments.Length < 3)
            {
                error = "MLO preview expects a .ytyp file and an output file.";
                return false;
            }

            command = new MloPreviewCommand(arguments[1], arguments[2], arguments.Skip(3).ToArray());
            return true;
        }

        if (operation == "mlo-edit")
        {
            if (arguments.Length != 4)
            {
                error = "MLO edit expects a .ytyp file, a patch file, and an output file.";
                return false;
            }

            command = new MloEditCommand(arguments[1], arguments[2], arguments[3]);
            return true;
        }

        if (operation == "convert")
        {
            if (arguments.Length != 4)
            {
                error = "Convert expects a direction, an input file, and an output file.";
                return false;
            }

            var direction = arguments[1].ToLowerInvariant();
            if (direction is not ("binary-to-xml" or "xml-to-binary"))
            {
                error = "Convert direction must be binary-to-xml or xml-to-binary.";
                return false;
            }

            command = new ConvertCommand(direction, arguments[2], arguments[3]);
            return true;
        }

        if (operation != "preview")
        {
            error = $"Unknown engine operation: {arguments[0]}";
            return false;
        }

        if (arguments.Length < 3)
        {
            error = "Preview expects a model, an output file, and any optional texture dictionaries.";
            return false;
        }

        command = new PreviewCommand(
            arguments[1],
            arguments[2],
            arguments.Skip(3).ToArray()
        );
        return true;
    }
}
