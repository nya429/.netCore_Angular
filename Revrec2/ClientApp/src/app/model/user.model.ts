export interface User {
    userID: number,
    userNameAD: string,
    userFirstName: string,
    userLastName: string,
    userEmail: string,
    administrator: number,
    helpdesk: number,
    specialist: number,
    supervisor: number
    activeFlag: boolean
}

export interface UserOption {
    userID: number,
    userNameAD: string,
    userFirstName: string,
    userLastName: string,
}

export interface Roles {
    administrator: number,
    helpdesk: number,
    specialist: number,
    supervisor: number
}

export interface EndpointRoleMap {
    module: {
        name: string,
        endpoint:
        {
            name: string,
            value: string
        } []
    } []
}




