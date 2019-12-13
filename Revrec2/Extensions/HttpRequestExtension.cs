using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Revrec2.Extensions
{
    public static class HttpRequestExtension
    {

        private const string USER_ID = "nameid";
        private const string USER_NAME = "unique_name";
        private const string USER_ROLE = "role";

        public static int GetUserID(this HttpRequest request)
        {
            int user_id = Int32.Parse(GetTokenValue(request, USER_ID));
            return user_id;
        }

        public static String GetUserRoleBinary(this HttpRequest request)
        {
            return (String)(GetTokenValue(request, USER_ROLE));
        }

        public static string GetUserName(this HttpRequest request)
        {
            return GetTokenValue(request, USER_NAME);
        }

        private static string GetTokenValue(HttpRequest request, string claimType)
        {
            try
            {
                StringValues bearerToken;
                var header = request.Headers;
                if (!request.Headers.TryGetValue("Access-token", out bearerToken))
                {
                    throw new KeyNotFoundException();
                }

                var accessToken = bearerToken.ToString().Remove(0, 7);
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(accessToken);
                string value = jsonToken.Claims.First(claim => claim.Type == claimType).Value;
                return value;
            }
            catch (KeyNotFoundException e)
            {
                throw e;
            }
        }
    }
}
