using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Models
{
    public class MemoryCacheSized
    {
        public MemoryCache Cache { get; set; }
        public MemoryCacheSized()
        {
            Cache = new MemoryCache(new MemoryCacheOptions
            {
                SizeLimit = 1024
            });
        }
    }
}
