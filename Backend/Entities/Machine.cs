using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Entities
{
    public class Machine
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Örn: "Ender 3 Pro", "Makine 1"
        public string MachinePhoto { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}