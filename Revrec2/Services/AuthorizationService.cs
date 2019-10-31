using Microsoft.Extensions.Configuration;
using Revrec2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Services
{

    public interface IAuthorizationService
    {
        String SetRoles(UserRecordPaged user);
        bool IsAuthorized(String roleBinary, [System.Runtime.CompilerServices.CallerMemberName]string endpointName = "");
        
    }

    public class AuthorizationService: IAuthorizationService
    {

        private readonly IConfiguration _config;

        public AuthorizationService(IConfiguration config)
        {
            _config = config;
        }

        // Set roleBinary based user's Roles
        public String SetRoles(UserRecordPaged user)
        {
            var rolesDecimal =
            user.Specialist * RoleDecimal.Specialist +
            user.Supervisor * RoleDecimal.Supervisor +
            user.Helpdesk * RoleDecimal.Helpdesk +
            user.Administrator * RoleDecimal.Admin;

            String roleBinary = Convert.ToString(rolesDecimal, 2);
            return roleBinary;
        }

        public bool IsAuthorized(string roleBiString, [System.Runtime.CompilerServices.CallerMemberName]string endpointName = "")
        {
            if (endpointName is null)
            {
                throw new ArgumentNullException(nameof(endpointName));
            }

            int toBase = 2;

            var endPointBiString = _config.GetValue<string>($"module:user:endpoint:{endpointName}", "0000");

            int roleBi = Convert.ToInt32(roleBiString, toBase);
            int endpointBi = Convert.ToInt32(endPointBiString, toBase);
   
            var isAuthorized = roleBi & endpointBi;
            return isAuthorized > 0;
        }

        /**
        private void TraceMessage(string message,
        [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
        [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "",
        [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0)
        {
            System.Diagnostics.Trace.WriteLine("message: " + message);
            System.Diagnostics.Trace.WriteLine("member name: " + memberName);
            System.Diagnostics.Trace.WriteLine("source file path: " + sourceFilePath);
            System.Diagnostics.Trace.WriteLine("source line number: " + sourceLineNumber);
        }
        */
    }
}
