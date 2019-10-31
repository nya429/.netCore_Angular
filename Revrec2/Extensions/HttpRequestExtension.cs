using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Extensions
{
    public static class HttpRequestExtension
    {
        public static int GetUserID(this HttpRequest request)
        {
            try
            {
                StringValues bearerToken;
                var header = request.Headers;
                if (!request.Headers.TryGetValue("Access-token", out bearerToken)) {
                    throw new KeyNotFoundException();
                }
               
                var accessToken = bearerToken.ToString().Remove(0, 7);
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(accessToken);
                var UserId = jsonToken.Claims.First(claim => claim.Type == "nameid").Value;
                return Int32.Parse(UserId);
            }
            catch (KeyNotFoundException e) {
                throw e;
            }

        }
  
        public static String GetUserRoleBinary(this HttpRequest request)
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
                var roleBin = jsonToken.Claims.First(claim => claim.Type == "role").Value;
                return (String)roleBin;
            }
            catch (KeyNotFoundException e)
            {
                throw e;
            }

        }
    }
}
