using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Extensions
{
    public static class IntExtensions
    {
        public static bool IsNullOrValue(this int? value, int valueToCheck) 
        {
            return (value ?? 0) == valueToCheck;
        }
    }
}
