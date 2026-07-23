namespace FiveMesh.Engine.Cli;

internal abstract record EngineCommand;

internal sealed record PreviewCommand(
    string ModelPath,
    string OutputPath,
    string? TexturePath
) : EngineCommand;
