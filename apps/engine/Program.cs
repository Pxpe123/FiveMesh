using FiveMesh.Engine.Application;
using FiveMesh.Engine.Cli;

if (!EngineCommandParser.TryParse(args, out var command, out var error))
{
    Console.Error.WriteLine(error);
    Console.Error.WriteLine(EngineCommandParser.Usage);
    return 2;
}

try
{
    switch (command)
    {
        case PreviewCommand preview:
            await new PreviewModelService().WriteAsync(preview);
            break;
        case ConvertCommand conversion:
            await new AssetConversionService().WriteAsync(conversion);
            break;
        case MloPreviewCommand mloPreview:
            await new MloPreviewService().WriteAsync(mloPreview);
            break;
        case MloEditCommand mloEdit:
            await new MloEditService().WriteAsync(mloEdit);
            break;
        default:
            throw new InvalidOperationException("The requested engine operation is not supported.");
    }

    return 0;
}
catch (Exception exception)
{
    Console.Error.WriteLine(exception.Message);
    return 1;
}
