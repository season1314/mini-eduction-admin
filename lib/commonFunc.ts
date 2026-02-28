/**
 * 
 * @param disabled 
 * @param operationList 
 * @returns 
 */
export function setOperationList(disabled: boolean[], operationList: any[]) {
    let list = operationList
    disabled.map((item, index) => {
        list[index].disabled = item
    })
    return list
}
