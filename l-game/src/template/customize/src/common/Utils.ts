// authors: qinyouyi,hexuchao
class MyLodash {
    /**
     * 打乱数组并且返回新数组
     */
    static shuffle(arr: any[]) {
        const length = arr.length;
        if (length === 0) return []
        let index = -1;
        const lastIndex = length - 1;
        const result = [...arr];
        while (++index < length) {
            // 拿到当前数组长度内的随机下标
            const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
            const value = result[rand];
            // 互换随机元素和当前index下的元素,最终所有当前index下的元素都被替换成随机元素
            result[rand] = result[index];
            result[index] = value
        }
        return result
    }
}
