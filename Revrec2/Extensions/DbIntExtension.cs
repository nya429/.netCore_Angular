using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Extensions
{
    public static class DbIntExtension
    {
        public static int? toInt(this object value)
        {
            if (value is DBNull)
            {
                return 0;
            }
            else
            {
                return (int)value;
            }
        }
    }
}
