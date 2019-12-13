using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Revrec2.Data;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Revrec2.Services;
using Revrec2.Extensions;

namespace Revrec2
{
    public class Startup
    {
        private readonly IConfiguration _config;
        private readonly ILoggerFactory _log;

        public  IHostingEnvironment _env;

        public Startup(IConfiguration configuration, IHostingEnvironment env, ILoggerFactory log)
        {
            _config = configuration;
            _env = env;
            _log = log;
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // set If true, IIS Server sets the HttpContext.User authenticated by Windows Authentication. 
            services.Configure<IISServerOptions>(options =>
            {
                options.AutomaticAuthentication = false;
            });
            
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            if (_env.IsProduction())
            {
                services.AddDbContext<DataContext>(options => options.UseSqlServer(_config.GetConnectionString("Production")));
            }
            else if (_env.IsEnvironment("UAT"))
            {
                 services.AddDbContext<DataContext>(options => options.UseSqlServer(_config.GetConnectionString("UAT")));
            }
            else
            {
                 services.AddDbContext<DataContext>(options => options.UseSqlServer(_config.GetConnectionString("Development")));
            }
            
            services.AddMemoryCache();
            services.AddCors();
            services.AddHttpContextAccessor();
            // Add Mapper Helper, needs using Microsoft.Extensions.DependencyInjection;
            // With version >= 6.0.1, it requires param  
            services.AddAutoMapper(typeof(Startup));

            // Add ServerSendEvent Service
            services.AddSingleton<SseService>();

            // Register Background HeartBeat
            services.AddHostedService<HeartbeatService>();
            services.AddSingleton<NotificationService>();
            services.AddSingleton<CommentNotificationService>();
            services.AddSingleton<DiscrepancyAssignmentService>();

            // Add Auth part
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options => {
                     options.TokenValidationParameters = new TokenValidationParameters
                     {
                         ValidateIssuerSigningKey = true,
                         IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII
                                  .GetBytes(_config.GetSection("AppSettings:Secret").Value)),
                         ValidateIssuer = false,
                         ValidateAudience = false
                     };
            });

            services.AddSingleton<IAuthorizationService, AuthorizationService>();


            // Add foront-end services . 
            // In production, the Angular files will be served from this directory
            // With In-process Hode Mode, using IIS express, NPM has directory issue
            services.AddNodeServices();
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILogger<Startup> logger)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else 
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.ConfigureExceptionHandler(logger);

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
    
            app.UseCors(x => x
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());

            app.UseAuthentication();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}
