export const roles ={
    pm:"pm",
    member: "member"
}as const;

export type Role = typeof roles[keyof typeof roles];