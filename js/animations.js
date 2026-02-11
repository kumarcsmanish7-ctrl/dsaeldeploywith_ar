// animations.js - Common animation utilities

class Animations {
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.classList.add('fade-in');
        await this.sleep(duration);
    }

    static async highlightElement(element, duration = 500) {
        element.classList.add('highlight');
        await this.sleep(duration);
        element.classList.remove('highlight');
    }

    static async moveElement(element, newPosition, duration = 500) {
        element.style.transition = `all ${duration}ms ease`;
        element.style.transform = `translate(${newPosition.x}px, ${newPosition.y}px)`;
        await this.sleep(duration);
    }

    static async animateQueueShift(elements, direction, duration = 500) {
        elements.forEach(el => {
            el.style.transition = `transform ${duration}ms ease`;
            el.style.transform = `translateX(${direction === 'left' ? '-90px' : '90px'})`;
        });
        await this.sleep(duration);
        elements.forEach(el => {
            el.style.transform = '';
        });
    }

    static async animateStackPush(element, duration = 500) {
        element.style.transform = 'translateY(-50px)';
        element.style.opacity = '0';
        await this.sleep(50);
        element.style.transition = `all ${duration}ms ease`;
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
        await this.sleep(duration);
    }

    static async animateStackPop(element, duration = 500) {
        element.style.transition = `all ${duration}ms ease`;
        element.style.transform = 'translateY(-50px)';
        element.style.opacity = '0';
        await this.sleep(duration);
        element.remove();
    }
}