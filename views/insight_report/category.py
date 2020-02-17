from parsing import *
import matplotlib.pyplot as plt
import collections
import numpy as np
import pickle
from matplotlib import cm

weekDays = ["Mon.", "Tue.", "Wed.", "Thur.", "Fri.", "Sat.", "Sun."]
id2category = {
        '1': 'Film & Animation',
        '2': 'Cars & Vehicles',
        '10': 'Music',
        '15': 'Pets & Animals',
        '17': 'Sport',
        '19': 'Travel & Events',  # api_bug
        '20': 'Gaming',
        '22': 'People & Blogs',  # api_bug
        '23': 'Comedy',
        '24': 'Entertainment',
        '25': 'News & Politics',  # api_bug
        '26': 'How-to & Style',
        '27': 'Education',  # api_bug
        '28': 'Science & Technology',
        '29': 'Non-profits & Activism'  # api_bug
    }

def get_category_counter():
    # ids = get_ids(takeout_html_file="test_takeout.html")
    ids = get_ids(takeout_html_file="watch_history.html")

    id_chunks = list(chunker_list(ids, 25))

    counter = collections.Counter()
    dayCounter = {category: collections.Counter() for category in id2category.values()}
    for id_chunk in id_chunks:
        info_chunk = get_video_info(id_chunk)
        for info in info_chunk:
            # print(info)
            day = weekDays[info['view_time'].weekday()]
            counter[id2category[info['categoryId']]] += 1
            dayCounter[id2category[info['categoryId']]][day] += 1
    counter = dict(counter.most_common())
<<<<<<< HEAD
    pickle.dump(counter, open('./counter_test', 'wb'))
    return counter
=======
    for category, day_counter in dayCounter.items():
        dayCounter[category] = dict(day_counter.most_common())
    # pickle.dump(counter, open('./counter_test', 'wb'))
    return counter, dayCounter

>>>>>>> 3188eea71c5559edf1603aae9186a47b65e763ed

def category_freq(counter):
    # counter = pickle.load(open('./counter_test', 'rb'))
    # counter = get_category_counter()
    sizes, labels = list(counter.values()), list(counter.keys())
    total = sum(counter.values())

    plt.rcdefaults()
    fig, ax = plt.subplots()

    sizes = [round(float(i / total), 4) * 100 for i in sizes]
    sizes, labels = sizes[0:5], labels[0:5]
    y_pos = np.arange(len(labels))
    error = np.random.rand(len(labels))

    colors = cm.rainbow(np.arange(len(sizes))/len(sizes))
    rects = ax.barh(y_pos, sizes, align='center', color=colors[::-1])
    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels)
    ax.invert_yaxis()  # labels read top-to-bottom

    for i, rect in enumerate(rects):
        ax.annotate(str(round(sizes[i], 2)) + '%',
                    xy=(rect.get_width(), rect.get_y() + rect.get_height() / 2),
                    xytext=(30, 0),
                    textcoords="offset points", fontsize=8,
                    ha='right', va='center')

    ax.set_xlabel('Frequencies')
    ax.set_title('Top 5 Favorite Categories')


def category_cmp(counter, selected=['Education', 'Music', 'Gaming'], type='Memory'):
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(aspect="equal"))
    # counter = pickle.load(open('./counter_test', 'rb'))

    sizes, labels = list(counter.values()), list(counter.keys())

    colors = cm.rainbow(np.arange(len(sizes)) / len(sizes))
    wedges, texts = ax.pie(sizes, wedgeprops=dict(width=0.5), startangle=-40, colors=colors[::-1])

    bbox_props = dict(boxstyle="square,pad=0.3", fc="w", ec="k", lw=0.2)
    kw = dict(arrowprops=dict(arrowstyle="-"),
              bbox=bbox_props, zorder=0, va="center")

    for i, p in enumerate(wedges):
        ang = (p.theta2 - p.theta1) / 2. + p.theta1
        y = np.sin(np.deg2rad(ang))
        x = np.cos(np.deg2rad(ang))
        # p.set_color("black")
        p.set_alpha(0.2)
        horizontalalignment = {-1: "right", 1: "left"}[int(np.sign(x))]
        connectionstyle = "angle,angleA=0,angleB={}".format(ang)
        kw["arrowprops"].update({"connectionstyle": connectionstyle})
        if labels[i] in selected:
            ax.annotate(labels[i], xy=(x, y), xytext=(1.35 * np.sign(x), 1.4 * y),
                    horizontalalignment=horizontalalignment, **kw)
            p.set_alpha(1)

<<<<<<< HEAD

    ax.set_title(type + " vs. Real Consumption")
    plt.show()

if __name__ == '__main__':
    counter = get_category_counter()
    category_cmp(counter=counter, selected=['Film & Animation', 'People & Blogs', 'Science & Technology'], type='Memory')
    category_cmp(counter=counter, selected=['Education', 'Music', 'Gaming'],
                 type='Intention')
=======
    ax.set_title("Intention vs. Real Consumption")
    plt.savefig('IntentionVsRealConsumption.png')
    # plt.show()


def category_with_day(day_counters):
    ind = np.arange(7)  # the x locations for the groups
    width = 0.35  # the width of the bars: can also be len(x) sequence
    print(day_counters)
    p = list()

    fig = plt.figure()
    fig.set_figheight(10)
    fig.set_figwidth(12)

    pre_sum = [0] * 7
    for cat in id2category.values():
        p.append(plt.bar(ind, day_counters[cat], width, bottom=pre_sum, color=color_map[cat]))
        for i in range(7):
            pre_sum[i] += day_counters[cat][i]

    plt.ylabel('Frequency')
    plt.title('What do you watch in a week?')
    plt.xticks(ind, weekDays)

    plt.legend(p, list(id2category.values()), loc='upper center', bbox_to_anchor=(0.5, -0.05), ncol=5)
    # print(id2category.values())
    # print(day_counters.keys())
    plt.savefig('frequency_over_weekday.png')


if __name__ == '__main__':
    counter, day_counters = get_category_counter()
    category_cmp(counter=counter)
>>>>>>> 3188eea71c5559edf1603aae9186a47b65e763ed
    category_freq(counter=counter)
    color_lists = cm.rainbow(np.arange(len(day_counters)) / len(day_counters)).tolist()
    color_map = {}

    for (idx, cat) in enumerate(list(day_counters.keys())):
        color_map[cat] = color_lists[idx]

    for category in id2category.values():
        if category not in day_counters:
            day_counters[category] = [0] * 7
        else:
            freq_list = [day_counters[category].get(weekday, 0) for weekday in weekDays]
            day_counters[category] = freq_list
    category_with_day(day_counters = day_counters)
