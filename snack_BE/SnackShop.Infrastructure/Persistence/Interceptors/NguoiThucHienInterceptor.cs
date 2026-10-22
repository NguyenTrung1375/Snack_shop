using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SnackShop.Application.Interfaces;

namespace SnackShop.Infrastructure.Persistence.Interceptors;

public class NguoiThucHienInterceptor : DbCommandInterceptor
{
    private readonly ICurrentUser _currentUser;

    public NguoiThucHienInterceptor(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
    {
        SetSessionVariable(command);
        return base.ReaderExecuting(command, eventData, result);
    }

    public override async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
        DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)
    {
        await SetSessionVariableAsync(command, cancellationToken);
        return await base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> NonQueryExecuting(
        DbCommand command, CommandEventData eventData, InterceptionResult<int> result)
    {
        SetSessionVariable(command);
        return base.NonQueryExecuting(command, eventData, result);
    }

    public override async ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
        DbCommand command, CommandEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        await SetSessionVariableAsync(command, cancellationToken);
        return await base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
    }

    public override InterceptionResult<object> ScalarExecuting(
        DbCommand command, CommandEventData eventData, InterceptionResult<object> result)
    {
        SetSessionVariable(command);
        return base.ScalarExecuting(command, eventData, result);
    }

    public override async ValueTask<InterceptionResult<object>> ScalarExecutingAsync(
        DbCommand command, CommandEventData eventData, InterceptionResult<object> result, CancellationToken cancellationToken = default)
    {
        await SetSessionVariableAsync(command, cancellationToken);
        return await base.ScalarExecutingAsync(command, eventData, result, cancellationToken);
    }

    private static bool IsDonHangCommand(string? sql)
    {
        if (string.IsNullOrWhiteSpace(sql))
            return false;

        var trimmed = sql.TrimStart();
        return trimmed.StartsWith("INSERT INTO `don_hang`", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("UPDATE `don_hang`", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("INSERT INTO don_hang", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("UPDATE don_hang", StringComparison.OrdinalIgnoreCase);
    }

    private void SetSessionVariable(DbCommand command)
    {
        if (command.Connection == null || !IsDonHangCommand(command.CommandText))
            return;

        using var setCmd = command.Connection.CreateCommand();
        setCmd.Transaction = command.Transaction;
        var userId = _currentUser.Id;
        setCmd.CommandText = $"SET @nguoi_thuc_hien = {(userId.HasValue ? $"'{userId.Value}'" : "NULL")};";
        setCmd.ExecuteNonQuery();
    }

    private async Task SetSessionVariableAsync(DbCommand command, CancellationToken cancellationToken)
    {
        if (command.Connection == null || !IsDonHangCommand(command.CommandText))
            return;

        await using var setCmd = command.Connection.CreateCommand();
        setCmd.Transaction = command.Transaction;
        var userId = _currentUser.Id;
        setCmd.CommandText = $"SET @nguoi_thuc_hien = {(userId.HasValue ? $"'{userId.Value}'" : "NULL")};";
        await setCmd.ExecuteNonQueryAsync(cancellationToken);
    }
}
