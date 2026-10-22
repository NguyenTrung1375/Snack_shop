using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace SnackShop.Infrastructure.Persistence.Converters;

public class SnakeCaseEnumConverter<T> : ValueConverter<T, string> where T : struct, Enum
{
    public SnakeCaseEnumConverter() : base(v => ToSnake(v.ToString()), s => Parse(s)) { }

    private static string ToSnake(string s) =>
        string.Concat(s.Select((c, i) => i > 0 && char.IsUpper(c) ? "_" + char.ToLowerInvariant(c) : char.ToLowerInvariant(c).ToString()));

    private static T Parse(string s) =>
        Enum.Parse<T>(string.Concat(s.Split('_', StringSplitOptions.RemoveEmptyEntries).Select(p => char.ToUpperInvariant(p[0]) + p[1..].ToLowerInvariant())), ignoreCase: true);
}
