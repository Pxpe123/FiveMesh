using CodeWalker.GameFiles;
using SharpDX;

namespace FiveMesh.Engine.Infrastructure.CodeWalker;

internal static class VertexAttributeReader
{
    internal static float[] ReadVector3(
        VertexData data,
        VertexDeclaration declaration,
        VertexSemantics semantic
    )
    {
        var component = (int)semantic;
        if (!HasComponent(declaration, component))
        {
            return [];
        }

        var offset = declaration.GetComponentOffset(component);
        var type = declaration.GetComponentType(component);
        var componentSize = GetVector3Size(type);
        if (!HasEnoughData(data, offset, componentSize))
        {
            return [];
        }

        var values = new float[data.VertexCount * 3];
        for (var index = 0; index < data.VertexCount; index++)
        {
            var value = ReadVector3(data.VertexBytes, data.VertexStride, index, offset, type);
            values[index * 3] = value.X;
            values[index * 3 + 1] = value.Y;
            values[index * 3 + 2] = value.Z;
        }

        return values;
    }

    internal static float[] ReadVector2(
        VertexData data,
        VertexDeclaration declaration,
        VertexSemantics semantic
    )
    {
        var component = (int)semantic;
        if (!HasComponent(declaration, component))
        {
            return [];
        }

        var offset = declaration.GetComponentOffset(component);
        var type = declaration.GetComponentType(component);
        var componentSize = GetVector2Size(type);
        if (!HasEnoughData(data, offset, componentSize))
        {
            return [];
        }

        var values = new float[data.VertexCount * 2];
        for (var index = 0; index < data.VertexCount; index++)
        {
            var value = ReadVector2(data.VertexBytes, data.VertexStride, index, offset, type);
            values[index * 2] = value.X;
            values[index * 2 + 1] = 1 - value.Y; // RAGE and WebGL use opposite V origins.
        }

        return values;
    }

    private static bool HasComponent(VertexDeclaration declaration, int component)
    {
        return (declaration.Flags & (1u << component)) != 0;
    }

    private static bool HasEnoughData(VertexData data, int offset, int componentSize)
    {
        if (
            componentSize == 0
            || data.VertexCount <= 0
            || data.VertexStride <= 0
            || data.VertexBytes is null
        )
        {
            return false;
        }

        var lastComponentEnd =
            (long)(data.VertexCount - 1) * data.VertexStride + offset + componentSize;
        return offset >= 0 && lastComponentEnd <= data.VertexBytes.LongLength;
    }

    private static int GetVector3Size(VertexComponentType type)
    {
        return type switch
        {
            VertexComponentType.Float3 => 12,
            VertexComponentType.Float4 => 16,
            VertexComponentType.Half4 => 8,
            VertexComponentType.RGBA8SNorm => 4,
            _ => 0
        };
    }

    private static int GetVector2Size(VertexComponentType type)
    {
        return type switch
        {
            VertexComponentType.Float2 => 8,
            VertexComponentType.Half2 => 4,
            VertexComponentType.Float4 => 16,
            VertexComponentType.Half4 => 8,
            _ => 0
        };
    }

    private static Vector3 ReadVector3(
        byte[] bytes,
        int stride,
        int vertexIndex,
        int offset,
        VertexComponentType type
    )
    {
        var start = vertexIndex * stride + offset;
        return type switch
        {
            VertexComponentType.Float3 or VertexComponentType.Float4 => new Vector3(
                BitConverter.ToSingle(bytes, start),
                BitConverter.ToSingle(bytes, start + 4),
                BitConverter.ToSingle(bytes, start + 8)
            ),
            VertexComponentType.Half4 => new Vector3(
                HalfToSingle(bytes, start),
                HalfToSingle(bytes, start + 2),
                HalfToSingle(bytes, start + 4)
            ),
            VertexComponentType.RGBA8SNorm => ReadPackedNormal(
                BitConverter.ToUInt32(bytes, start)
            ),
            _ => throw new InvalidDataException($"Unsupported Vector3 type: {type}")
        };
    }

    private static Vector2 ReadVector2(
        byte[] bytes,
        int stride,
        int vertexIndex,
        int offset,
        VertexComponentType type
    )
    {
        var start = vertexIndex * stride + offset;
        return type switch
        {
            VertexComponentType.Float2 or VertexComponentType.Float4 => new Vector2(
                BitConverter.ToSingle(bytes, start),
                BitConverter.ToSingle(bytes, start + 4)
            ),
            VertexComponentType.Half2 or VertexComponentType.Half4 => new Vector2(
                HalfToSingle(bytes, start),
                HalfToSingle(bytes, start + 2)
            ),
            _ => throw new InvalidDataException($"Unsupported Vector2 type: {type}")
        };
    }

    private static Vector3 ReadPackedNormal(uint packed)
    {
        return new Vector3(
            SignedByteToFloat((byte)(packed & 0xff)),
            SignedByteToFloat((byte)((packed >> 8) & 0xff)),
            SignedByteToFloat((byte)((packed >> 16) & 0xff))
        );
    }

    private static float SignedByteToFloat(byte value)
    {
        return Math.Clamp((sbyte)value / 127f, -1f, 1f);
    }

    private static float HalfToSingle(byte[] bytes, int start)
    {
        return (float)BitConverter.UInt16BitsToHalf(BitConverter.ToUInt16(bytes, start));
    }
}
