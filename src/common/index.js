/**
 * Created by yonghuapro on 2017/8/10.
 */

export default {
    getRandom(start,end){
        let random = Math.random();
        if(start !== undefined && end !== undefined){
            return start + random * (end - start + 1) | 0;
        }else if(start !== undefined){
            return random * start | 0;
        }else{
            return random;
        }
    },
    getIntersectionList(){

        let list1 = arguments[0];
        let list2 = arguments[1];
        if(list1 && list2){
            let intersectionList = list1.filter(str => {
                return list2.indexOf(str) >= 0;
            });

            if(arguments[2]){
                let newArgs = [intersectionList,...Array.prototype.slice.apply(arguments,[2])];
                return this.getIntersectionList.apply(this,newArgs);
            }else{
                return intersectionList;
            }
        }else{
            return list1;
        }
    }
}