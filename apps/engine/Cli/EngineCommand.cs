namespace FiveMesh.Engine.Cli;

internal abstract record EngineCommand;

internal sealed record PreviewCommand(
    string ModelPath,
    string OutputPath,
    IReadOnlyList<string> TexturePaths
) : EngineCommand;

internal sealed record ConvertCommand(
    string Direction,
    string InputPath,
    string OutputPath
) : EngineCommand;

internal sealed record MloPreviewCommand(
    string YtypPath,
    string OutputPath,
    IReadOnlyList<string> AssetPaths
) : EngineCommand;

internal sealed record MloEditCommand(
    string YtypPath,
    string PatchPath,
    string OutputPath
) : EngineCommand;
