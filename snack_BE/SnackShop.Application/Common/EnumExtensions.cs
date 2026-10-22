namespace SnackShop.Application.Common;

public static class EnumExtensions
{
    public static string ToSnakeCase(this Enum value)
    {
        var s = value.ToString();
        return string.Concat(s.Select((c, i) => i > 0 && char.IsUpper(c) ? "_" + char.ToLowerInvariant(c) : char.ToLowerInvariant(c).ToString()));
    }
}
