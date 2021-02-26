// authors: qinyouyi,hexuchao
class MyLodash {
    /**
     * 打乱数组并且返回新数组
     */
    static shuffle(arr: any[]) {
        let length = arr.length;
        while (length > 1) {
            const random = ~~(Math.random() * length)
            let temp = arr[length]
            arr[length] = arr[random]
            arr[random] = temp
        }
        return arr
    }

    static range(size: number, start = 0) {
        return Array.from({ length: size }, (_, i) => i + start)
    }
}
