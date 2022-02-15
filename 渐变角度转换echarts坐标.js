// deg角度转换成echarts 渐变的x y
function getLocation(rotate) {
    const dx = Math.cos(((rotate - 90) / 180) * Math.PI)
    const dy = Math.sin(((rotate - 90) / 180) * Math.PI)
    const tanV = dx / dy
    const directSign = Math.abs(tanV) < 1
    const t = directSign ? tanV : 1 / tanV

    const sign1 = t > 0 ? 1 : -1
    const sign2 = dx > 0 ? 1 : -1
    const sign = directSign ? sign1 * sign2 : sign2

    const group1 = [ 0.5 - sign * t / 2, 0.5 + sign * t / 2]
    const group2 = sign > 0 ? [0, 1] : [1, 0]
    const group = [...group1, ...group2]
    const keys = directSign ? ['x', 'x2', 'y', 'y2'] : ['y', 'y2', 'x', 'x2' ]

    let res = {}
    keys.forEach((k, idx) => {
        res[k] = group[idx]
    })
    return res
}