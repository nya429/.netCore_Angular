export interface RawDiscrepancyComment {
    discrepancyCommentID: number,
    discrepancyID: number,
    replyCommentID: number,
    comment_UserID: number,
    userFirstName: string,
    userLastName: string,
    discrepancyComment: string,
    activeFlag: boolean,
    insertDate: string,
    updateDate: string
}

export interface DiscrepancyComment {
    discrepancyCommentID: number,
    discrepancyID: number,
    replyCommentID: number,
    comment_UserID: number,
    userFirstName: string,
    userLastName: string,
    discrepancyComment: string,
    activeFlag: boolean,
    insertDate: string,
    updateDate: string
    subComments: RawDiscrepancyComment[]
}