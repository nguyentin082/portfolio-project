export class ResponsePresentationMapper {
  static toResponse<T>(data: T) {
    return {
      success: true,
      data: data,
    };
  }
  static toPaginationResponse<T>(data: T, total: number) {
    return {
      success: true,
      data: data,
      total: total,
    };
  }
}
