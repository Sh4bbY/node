#!/usr/bin/env bash

echo "
------- start provisioning ---------
"

USER=vagrant
DESKTOP=true
VBOX_VERSION=5.1.18


echo "
================> Environment Setup"

yum clean all
yum clean expire-cache
yum update

echo " --> install Group 'development tools'"
yum groupinstall -q -y 'Development Tools'

echo " --> install vim"
yum install -q -y vim

echo " --> install NVM"
HOME="/home/$USER"
curl -s -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash

echo " --> install docker"
yum install -q -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum makecache fast
yum install -q -y docker-ce
curl -L https://github.com/docker/compose/releases/download/1.13.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose

echo " --> disable firewall"
systemctl disable firewalld

echo " --> git-completion"
curl -s https://github.com/git/git/blob/master/contrib/completion/git-completion.bash -o /etc/bash_completion.d/git-completion.bash

echo " --> git-bash-promt"
git clone https://github.com/magicmonty/bash-git-prompt.git /home/$USER/.bash-git-prompt --depth=1
echo "
# load bash-git-promt
GIT_PROMPT_ONLY_IN_REPO=1
  source ~/.bash-git-prompt/gitprompt.sh
" >> /home/$USER/.bashrc

echo " --> set owner rights"
chown -R $USER:$USER /home/$USER

echo "
================> Project Setup"

echo " --> install elasticsearch"
rpm --import https://packages.elastic.co/GPG-KEY-elasticsearch
echo "[elastic-2.x]
name=Elasticsearch repository for 2.x packages
baseurl=https://packages.elastic.co/elastic/2.x/centos
gpgcheck=1
gpgkey=https://packages.elastic.co/GPG-KEY-elastic
enabled=1" > /etc/yum.repos.d/elasticsearch.repo
yum install elasticsearch
systemctl enable elasticsearch


if [ $DESKTOP ]
  then
    echo "
    ================> Desktop Setup"

    echo " --> install libs necessary for guest additions"
    yum install -q -y kernel-devel-$(uname -r)
    yum groupinstall -q -y "X Window System"

    echo " --> mount and install guest additions for Virtualbox $VBOX_VERSION"
    curl -s http://download.virtualbox.org/virtualbox/$VBOX_VERSION/VBoxGuestAdditions_$VBOX_VERSION.iso -o /home/$USER/VBoxGuestAdditions.iso
    mount -o loop /home/$USER/VBoxGuestAdditions.iso /mnt
    sh /mnt/VBoxLinuxAdditions.run
    umount /mnt
    rm -f /home/$USER/VBoxGuestAdditions.iso

    echo " --> install Group Fonts"
    yum -q -y groupinstall "Fonts"

    echo " --> install Gnome"
    yum -q -y groupinstall 'gnome desktop' --setopt=group_package_types=mandatory
    yum install -q -y openssh-askpass-gnome

    echo " --> Setup the Graphical Userinterface"
    systemctl set-default graphical.target

    echo " --> install Terminator"
    yum -q -y epel-release
    yum -q -y install terminator

    echo " --> install Firefox"
    yum -q -y install firefox
fi

echo "
------- provisioning complete ---------
"

if [ $DESKTOP ]
  then
    echo " --> reboot"
    reboot
fi
