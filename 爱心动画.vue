<template>
    <block>
        <div v-show="like" ref="likeIcon">
            <i class="iconfont-common icon-kdat_common_currency_heart_fill" @click="changeLike" />
        </div>
        <div v-show="!like" ref="dislikeIcon">
            <i class="iconfont-common icon-kdat_common_currency_heart" @click="changeLike" />
        </div>
    </block>
</template>

<script>
export default {
    name: 'creative-workshop',
    data() {
        return {
            like: true,
            isAnimation: false,
        };
    },
    methods: {
        changeLike() {
            if (this.isAnimation) return;
            this.isAnimation = true;
            const likeIcon = this.$refs.likeIcon;
            const dislikeIcon = this.$refs.dislikeIcon;
            let time1 = 0;
            if (this.like) {
                likeIcon.className = 'likeLeave';
                dislikeIcon.className = 'dislikeEnter';
                time1 = 600;
            } else {
                dislikeIcon.className = 'dislikeLeave';
                likeIcon.className = 'likeEnter';
                time1 = 400;
            }
            setTimeout(() => {
                this.like = !this.like;
                setTimeout(() => {
                    dislikeIcon.className = '';
                    likeIcon.className = '';
                    this.isAnimation = false;
                }, 1000 - time1);
            }, time1);
        },
    },
};
</script>
<style lang="less" scoped>
div {
    margin: 50px;
    height: 50px;
    width: 50px;
    transform-origin: 50% 50%;
    transform: scale(1, 1);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    &:first-child {
        border: 0px solid red;
    }
    i {
        cursor: pointer;
        font-size: 50px;
        color: red;
    }
    .likeLeave {
        animation: likeAnimation 0.6s;
    }
    .likeEnter {
        animation: likeAnimation 0.6s reverse;
    }
    .dislikeEnter {
        animation: dislikeAnimation 0.4s;
    }
    .dislikeLeave {
        animation: dislikeAnimation 0.4s reverse;
    }
}
@keyframes likeAnimation {
    0% {
        transform: scale(1, 1);
    }
    40% {
        transform: scale(1.3, 1.3);
    }
    100% {
        transform: scale(0, 0);
    }
}
@keyframes dislikeAnimation {
    0% {
        transform: scale(0, 0);
    }
    100% {
        transform: scale(1, 1);
    }
}
</style>
