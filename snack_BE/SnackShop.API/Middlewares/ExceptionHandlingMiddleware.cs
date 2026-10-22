using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MySqlConnector;
using SnackShop.Application.Common;

namespace SnackShop.API.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, "AppException caught: {Message} (Status: {StatusCode})", ex.Message, ex.StatusCode);
            await WriteResponseAsync(context, ex.StatusCode, ex.Message);
        }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { SqlState: "45000" } myEx)
        {
            _logger.LogWarning(ex, "MySQL trigger 45000 caught: {Message}", myEx.Message);
            await WriteResponseAsync(context, StatusCodes.Status400BadRequest, myEx.Message);
        }
        catch (DbUpdateException ex) when (ex.GetBaseException() is MySqlException { SqlState: "45000" } myEx)
        {
            _logger.LogWarning(ex, "MySQL trigger 45000 (base) caught: {Message}", myEx.Message);
            await WriteResponseAsync(context, StatusCodes.Status400BadRequest, myEx.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await WriteResponseAsync(context, StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi hệ thống.");
        }
    }

    private static async Task WriteResponseAsync(HttpContext context, int statusCode, string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.ContentType = "application/json; charset=utf-8";
        context.Response.StatusCode = statusCode;

        var errorResponse = new
        {
            message,
            status = statusCode
        };

        var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
