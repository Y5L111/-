/**
 * 解析字符串
 * 得到一个数组
 * {time:开始时间, words:歌词内容}
 */
function parseLyric(lrc) {
    const lyrics = lrc.split('\n');//先按行分割
    const lrcObj = [];
    for (let i = 0; i < lyrics.length; i++) {
        const timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;//时间的正则规则
        const timeRegExpArr = lyrics[i].match(timeReg);//得到时间的数组
        const clause = lyrics[i].replace(timeReg, '');//去掉时间，得到歌词内容
        if (!timeRegExpArr) continue;
        const t = timeRegExpArr[0];
        const min = Number(String(t.match(/\[\d*/i)).slice(1));
        //包含小数点后两位
        //const sec = Number(String(t.match(/\:\d*/i)).slice(1));
        const sec = t.match(/\[\d{2}:(\d{2}\.\d{2,3})\]/);
        //console.log(Number(sec[1]));
        const time = min * 60 + Number(sec[1]) - 0.6;
        lrcObj.push({ time, clause });
    }
    return lrcObj;
}

const lrcData = parseLyric(lrc);
console.log(lrcData);

//获取需要的dom
let doms = {
    audio: document.querySelector('audio'),
    ul: document.querySelector('.lrc'),
    mainbox: document.querySelector('.mainbox')
}

/**
 * 计算高亮显示的歌词下表
*/
function findIndex() {
    let currentTime = doms.audio.currentTime;
    //console.log(doms.audio.currentTime);
    for (let i = 0; i < lrcData.length; i++) {
        if (currentTime < lrcData[i].time) {
            return i - 1;
        }
    }
    return lrcData.length - 1;
}

//界面初始化
const initLrcElement = () => {
    for (let i = 0; i < lrcData.length; i++) {
        let li = document.createElement('li');
        li.textContent = lrcData[i].clause;
        doms.ul.appendChild(li);
    }
}
initLrcElement();


//容器高度
let mainboxHeight = doms.mainbox.clientHeight;
//每个li的高度
let liHeight = doms.ul.children[0].clientHeight;
//最大偏移量
let ulHeight = doms.ul.clientHeight - mainboxHeight;


//设置偏移量
const setOffset = () => {
    let index = findIndex();
    let offset = index * liHeight - mainboxHeight / 2 - liHeight / 2; //计算偏移量
    if (offset < 0) {
        offset = 0;
    }
    if (offset > ulHeight) {
        offset = ulHeight;
    }
    doms.ul.style.transform = `translateY(-${offset}px)`;//设置偏移量
    //去掉之前的样式
    let li = doms.ul.querySelector('.active');
    if (li) {
        li.classList.remove('active');//去掉之前的样式
    }
    doms.ul.children[index].classList.add('active');
}


//播放按钮
const play = document.getElementById('playButton');

play.onclick = function () {
    if (doms.audio.paused) {
        doms.audio.play();
        play.innerHTML = '暂停';
    } else {
        doms.audio.pause();
        play.innerHTML = '播放';
    }
}


//播放时间
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');
const seekBar = document.getElementById('range');
//监听audio的时间变化
doms.audio.addEventListener('timeupdate', () => {
    setOffset();
    const currentTime = doms.audio.currentTime;//获取当前播放时间
    const duration = doms.audio.duration;//获取音频总时长
    currentTimeSpan.textContent = formatTime(currentTime);
    durationSpan.textContent = formatTime(duration);
    seekBar.value = (currentTime / duration) * 100;
})

// 更新播放位置
seekBar.addEventListener('input', function () {
    const seekTo = doms.audio.duration * (seekBar.value / 100);
    doms.audio.currentTime = seekTo;
});

// 辅助函数：将秒数转换为 mm:ss 格式
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

// 辅助函数：确保数字显示为两位数
function padZero(number) {
    return (number < 10 ? '0' : '') + number;
}