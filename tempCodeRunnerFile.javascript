function findMedian(arr){
    let median;
    let mid = arr.length/2;

    for(let i = 0; i< arr.length; i++){
        for(let j = 0; j < arr.length; j++){
            if(arr[i] < arr[j]){
                arr[i] = arr[i] + arr[j];
                arr[j] = arr[i] - arr[j];
                arr[i] = arr[i] - arr[j];

            }
        }
    }
    console.log(arr);

    if(arr.length %2 == 0){
        median = (arr[mid] + arr[mid + 1])/2
    }else{
        median = arr[mid]
    }
    console.log(median);
    
}

const arr = [3,5,1,23,7];
findMedian(arr);
