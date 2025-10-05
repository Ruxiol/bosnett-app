import PostsPagination from "./PostsPagination";

export default interface IResponse<T> {
    status: boolean;
    data: T;
    pagination?: PostsPagination;
    message?: string;
}