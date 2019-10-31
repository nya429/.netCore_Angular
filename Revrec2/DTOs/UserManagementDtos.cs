using Revrec2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Revrec2.DTOs
{
    public class UsersListRequestDto
    {
        public int? UserID { get; set; }
        public string UserNameAD { get; set; }
        public int? PageIndex { get; set; }
        public int? PageSize { get; set; }
        public string SortBy { get; set; }
        public int? OrderBy { get; set; }
    }

    public partial class UsersListDto
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

    public class UsersForCreateDto
    {
        public int UserID { get; set; }
        public string UserNameAD { get; set; }
        public string UserEmail { get; set; }
        public string UserFirstName { get; set; }
        public string UserLastName { get; set; }
        public bool RoleAdministrator { get; set; }
        public bool RoleHelpdesk { get; set; }
        public bool RoleSpecialist { get; set; }
        public bool RoleSupervisor { get; set; }
        public bool ActiveFlag { get; set; }
    }

    public class UserForAuthDto
    {
        public UserRecordPaged UserInfo { get; set; }
        public string Token { get; set; }

    }
}

