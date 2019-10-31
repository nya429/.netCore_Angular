using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.Models
{
    public class UsersForDropDown
    {
        public int UserID { get; set; }
        public string UserNameAD { get; set; }
    }

    public partial class UsersListPaged
    {
        public int UserID { get; private set; }
        public string UserNameAD { get; private set; }
        public string UserEmail { get; private set; }
        public string UserFirstName { get; private set; }
        public string UserLastName { get; private set; }
        public int Administrator { get; private set; }
        public int Helpdesk { get; private set; }
        public int Specialist { get; private set; }
        public int Supervisor { get; private set; }
    }

    public partial class UserRecordPaged
    {
        public int UserID { get; private set; }
        public string UserNameAD { get; private set; }
        public string UserEmail { get; private set; }
        public string UserFirstName { get; private set; }
        public string UserLastName { get; private set; }
        public int Administrator { get; private set; }
        public int Helpdesk { get; private set; }
        public int Specialist { get; private set; }
        public int Supervisor { get; private set; }
        public bool ActiveFlag { get; private set; }
        public DateTime InsertDate { get; private set; }
        public DateTime UpdateDate { get; private set; }
    }
    public static class RoleDecimal
    {
        public const int Admin = 8;
        public const int Supervisor = 2;
        public const int Helpdesk = 4;
        public const int Specialist = 1;
    }

    public static class Role
    {
        public const string Admin = "Administrator";
        public const string Supervisor = "Supervisor";
        public const string Helpdesk = "Helpdesk";
        public const string Specialist = "Specialist";
    }
}
