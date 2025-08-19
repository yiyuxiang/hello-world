import request from '@/utils/request'

// 创建预约
export const createAppointmentService = (data) => {
    return request.post('/appointment/add', data)
}

// 检查是否已预约
export const checkAppointmentService = (houseId) => {
    const id = Number(houseId)
    return request.get('/appointment/check', {params: {HouseId: id}})
}


// 获取租户预约列表
export const getAppointmentListService = () => {
    return request.get('/appointment/userList')
}

// 获取房东预约列表
export const getLandlordAppointmentListService = () => {
    return request.get('/appointment/landlordList')
}

// 取消预约
export const cancelAppointmentService = (id) => {
    return request.patch('/appointment/cancel?appointmentId=' + id)
}

// 确认预约
export const confirmAppointmentService = (id) => {
    return request.patch('/appointment/confirm?appointmentId=' + id)
}

// 拒绝预约
export const rejectAppointmentService = (id) => {
    return request.patch('/appointment/refuse?appointmentId=' + id)
}



// 创建签约
export const createContractService = (data) => {
    return request.post('/contract/add', data)
}

// 检查是否已签约
export const checkContractService = (houseId) => {
    return request.get('/contract/check', {params: {HouseId: houseId}})
}

// 获取租户签约列表
export const getUserContractListService = () => {
    return request.get('/contract/userList')
}

// 获取房东签约列表
export const getLandlordContractListService = () => {
    return request.get('/contract/landlordList')
}


// 房东将签约状态修改为1，表示履行中，确认签约 status=1
export const confirmContractService = (id) => {
    return request.patch('/contract/confirm?contractId=' + id)
}

// 房东拒绝签约，status=2
export const rejectContractService = (id) => {
    return request.patch('/contract/refuse?contractId=' + id)
}

// 租户申请终止 ，status=3
export const applyTerminateContractService = (id) => {
    return request.patch('/contract/cancel?contractId=' + id)
}

// 房东同意终止
export const agreeTerminateContractService = (id) => {
    return request.patch('/contract/agreeCancel?contractId=' + id)
}

 // 房东不同意终止
 export const disagreeTerminateContractService = (id) => {
    return request.patch('/contract/disagreeCancel?contractId=' + id)
}



