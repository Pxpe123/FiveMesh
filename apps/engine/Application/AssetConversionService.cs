using CodeWalker.GameFiles;
using FiveMesh.Engine.Cli;

namespace FiveMesh.Engine.Application;

internal sealed class AssetConversionService
{
    internal async Task WriteAsync(ConvertCommand command)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(command.OutputPath) ?? ".");

        if (command.Direction == "binary-to-xml")
        {
            await WriteXmlAsync(command);
            return;
        }

        await WriteBinaryAsync(command);
    }

    private static async Task WriteXmlAsync(ConvertCommand command)
    {
        var extension = Path.GetExtension(command.InputPath).ToLowerInvariant();
        var outputDirectory = Path.GetDirectoryName(command.OutputPath) ?? ".";
        var bytes = await File.ReadAllBytesAsync(command.InputPath);
        var xml = extension switch
        {
            ".ydr" => YdrXml.GetXml(LoadYdr(bytes), outputDirectory),
            ".yft" => YftXml.GetXml(LoadYft(bytes), outputDirectory),
            ".ytd" => YtdXml.GetXml(LoadYtd(bytes), outputDirectory),
            _ => throw new InvalidDataException("Binary conversion supports YDR, YFT, and YTD files."),
        };

        await File.WriteAllTextAsync(command.OutputPath, xml);
    }

    private static async Task WriteBinaryAsync(ConvertCommand command)
    {
        var extension = Path.GetExtension(command.OutputPath).ToLowerInvariant();
        var inputDirectory = Path.GetDirectoryName(command.InputPath) ?? ".";
        var xml = await File.ReadAllTextAsync(command.InputPath);
        var bytes = extension switch
        {
            ".ydr" => XmlYdr.GetYdr(xml, inputDirectory).Save(),
            ".yft" => XmlYft.GetYft(xml, inputDirectory).Save(),
            ".ytd" => XmlYtd.GetYtd(xml, inputDirectory).Save(),
            _ => throw new InvalidDataException("XML conversion supports YDR, YFT, and YTD output files."),
        };

        await File.WriteAllBytesAsync(command.OutputPath, bytes);
    }

    private static YdrFile LoadYdr(byte[] bytes)
    {
        var file = new YdrFile();
        file.Load(bytes);
        return file;
    }

    private static YftFile LoadYft(byte[] bytes)
    {
        var file = new YftFile();
        file.Load(bytes);
        return file;
    }

    private static YtdFile LoadYtd(byte[] bytes)
    {
        var file = new YtdFile();
        file.Load(bytes);
        return file;
    }
}
